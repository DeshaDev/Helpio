// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract QAPoints {
    struct Question {
        address author;
        string questionId;
        string category;
        uint256 timestamp;
        bool exists;
    }

    struct Answer {
        address author;
        string answerId;
        string questionId;
        uint256 timestamp;
        bool isBestAnswer;
        bool exists;
    }

    struct User {
        uint256 totalPoints;
        uint256 questionsAsked;
        uint256 answersGiven;
        uint256 bestAnswers;
    }

    mapping(string => Question) public questions;
    mapping(string => Answer) public answers;
    mapping(address => User) public users;
    mapping(string => address) public questionAuthors;

    uint256 public constant ASK_QUESTION_POINTS = 5;
    uint256 public constant ANSWER_QUESTION_POINTS = 5;
    uint256 public constant BEST_ANSWER_POINTS = 10;

    event QuestionAsked(address indexed author, string questionId, string category, uint256 timestamp);
    event AnswerSubmitted(address indexed author, string answerId, string questionId, uint256 timestamp);
    event BestAnswerSelected(address indexed questionAuthor, address indexed answerAuthor, string answerId, string questionId, uint256 timestamp);

    function askQuestion(string memory questionId, string memory category) external {
        require(!questions[questionId].exists, "Question already exists");
        require(bytes(category).length > 0, "Category cannot be empty");

        questions[questionId] = Question({
            author: msg.sender,
            questionId: questionId,
            category: category,
            timestamp: block.timestamp,
            exists: true
        });

        questionAuthors[questionId] = msg.sender;

        users[msg.sender].totalPoints += ASK_QUESTION_POINTS;
        users[msg.sender].questionsAsked += 1;

        emit QuestionAsked(msg.sender, questionId, category, block.timestamp);
    }

    function submitAnswer(string memory answerId, string memory questionId) external {
        require(questions[questionId].exists, "Question does not exist");
        require(!answers[answerId].exists, "Answer already exists");

        answers[answerId] = Answer({
            author: msg.sender,
            answerId: answerId,
            questionId: questionId,
            timestamp: block.timestamp,
            isBestAnswer: false,
            exists: true
        });

        users[msg.sender].totalPoints += ANSWER_QUESTION_POINTS;
        users[msg.sender].answersGiven += 1;

        emit AnswerSubmitted(msg.sender, answerId, questionId, block.timestamp);
    }

    function selectBestAnswer(string memory answerId, string memory questionId) external {
        require(questions[questionId].exists, "Question does not exist");
        require(answers[answerId].exists, "Answer does not exist");
        require(questionAuthors[questionId] == msg.sender, "Only question author can select best answer");
        require(!answers[answerId].isBestAnswer, "Answer already marked as best");
        require(keccak256(bytes(answers[answerId].questionId)) == keccak256(bytes(questionId)), "Answer does not belong to this question");

        answers[answerId].isBestAnswer = true;

        address answerAuthor = answers[answerId].author;
        users[answerAuthor].totalPoints += BEST_ANSWER_POINTS;
        users[answerAuthor].bestAnswers += 1;

        emit BestAnswerSelected(msg.sender, answerAuthor, answerId, questionId, block.timestamp);
    }

    function getUserPoints(address user) external view returns (uint256) {
        return users[user].totalPoints;
    }

    function getUserStats(address user) external view returns (
        uint256 totalPoints,
        uint256 questionsAsked,
        uint256 answersGiven,
        uint256 bestAnswers
    ) {
        User memory userStats = users[user];
        return (
            userStats.totalPoints,
            userStats.questionsAsked,
            userStats.answersGiven,
            userStats.bestAnswers
        );
    }

    function getQuestion(string memory questionId) external view returns (
        address author,
        string memory category,
        uint256 timestamp,
        bool exists
    ) {
        Question memory q = questions[questionId];
        return (q.author, q.category, q.timestamp, q.exists);
    }

    function getAnswer(string memory answerId) external view returns (
        address author,
        string memory questionId,
        uint256 timestamp,
        bool isBestAnswer,
        bool exists
    ) {
        Answer memory a = answers[answerId];
        return (a.author, a.questionId, a.timestamp, a.isBestAnswer, a.exists);
    }
}
