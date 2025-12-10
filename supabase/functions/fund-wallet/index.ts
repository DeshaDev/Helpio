import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { ethers } from "npm:ethers@6.13.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FUNDING_AMOUNT = "0.12"; // CELO amount to send
const CELO_RPC_URL = "https://forno.celo.org";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: "Wallet address required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate address format
    if (!ethers.isAddress(walletAddress)) {
      return new Response(
        JSON.stringify({ error: "Invalid wallet address" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Normalize address to lowercase
    const normalizedAddress = walletAddress.toLowerCase();

    // Check if wallet already funded
    const { data: existingFunding } = await supabase
      .from("funded_wallets")
      .select("id")
      .eq("wallet_address", normalizedAddress)
      .maybeSingle();

    if (existingFunding) {
      return new Response(
        JSON.stringify({ error: "Wallet already funded" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get treasury private key from environment
    const treasuryPrivateKey = Deno.env.get("TREASURY_PRIVATE_KEY");
    if (!treasuryPrivateKey) {
      throw new Error("Treasury private key not configured");
    }

    // Connect to Celo network
    const provider = new ethers.JsonRpcProvider(CELO_RPC_URL);
    const treasuryWallet = new ethers.Wallet(treasuryPrivateKey, provider);

    // Check treasury balance
    const balance = await treasuryWallet.provider.getBalance(treasuryWallet.address);
    const requiredAmount = ethers.parseEther(FUNDING_AMOUNT);
    
    if (balance < requiredAmount) {
      throw new Error(`Insufficient treasury balance. Have: ${ethers.formatEther(balance)} CELO, Need: ${FUNDING_AMOUNT} CELO`);
    }

    // Send CELO to the new wallet
    const tx = await treasuryWallet.sendTransaction({
      to: walletAddress,
      value: requiredAmount,
    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction failed");
    }

    // Record the funding in database
    const { error: insertError } = await supabase
      .from("funded_wallets")
      .insert({
        wallet_address: normalizedAddress,
        transaction_hash: receipt.hash,
        amount: FUNDING_AMOUNT,
        ip_address: req.headers.get("x-forwarded-for") || null,
      });

    if (insertError) {
      console.error("Failed to record funding:", insertError);
    }

    console.log(`✅ Funded ${walletAddress} with ${FUNDING_AMOUNT} CELO`);

    return new Response(
      JSON.stringify({
        success: true,
        transactionHash: receipt.hash,
        amount: `${FUNDING_AMOUNT} CELO`,
        explorerUrl: `https://celoscan.io/tx/${receipt.hash}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Funding error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Funding failed",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});