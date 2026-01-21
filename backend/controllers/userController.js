import Thread from "../models/Thread.js";
import Reply from "../models/Reply.js";
import User from "../models/User.js";
import UserAuth from "../models/UserAuth.js";

// Define associations
Thread.belongsTo(User, { foreignKey: 'author_id' });
Reply.belongsTo(User, { foreignKey: 'author_id' });
Reply.belongsTo(Thread, { foreignKey: 'thread_id' });
User.belongsTo(UserAuth, { foreignKey: 'user_id' });

const flashCard = async () => { }

const quizCard = async () => { }

const discussionCard = async (req, res) => {
    try {
        const threads = await Thread.findAll({
            include: [
                {
                    model: User,
                    attributes: ["name"],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        const formattedThreads = await Promise.all(threads.map(async (thread) => {
            const replyCount = await Reply.count({ where: { thread_id: thread.thread_id } });
            return {
                id: thread.thread_id,
                title: thread.title,
                content: thread.content,
                author: thread.User ? thread.User.name : "Unknown",
                replies: replyCount,
                views: thread.views,
                createdAt: thread.created_at,
                lastReplyAt: thread.last_reply_at,
            };
        }));

        res.status(200).json(formattedThreads);
    } catch (error) {
        console.error("Error fetching threads:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const createThread = async (req, res) => {
    try {
        const { title, content, author_id } = req.body;

        if (!title || !content || !author_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newThread = await Thread.create({
            title,
            content,
            author_id,
        });

        res.status(201).json(newThread);
    } catch (error) {
        console.error("Error creating thread:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const updateThread = async (req, res) => {
    try {
        const { threadId } = req.params;
        const { title, content } = req.body;
        const userId = req.user.user_id;
        const userRole = req.user.role;

        const thread = await Thread.findByPk(threadId);

        if (!thread) {
            return res.status(404).json({ message: "Thread not found" });
        }

        if (thread.author_id !== userId && userRole !== 'reviewer' && userRole !== 'admin') {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Thread.update({ title, content }, { where: { thread_id: threadId } });
        res.status(200).json({ message: "Thread updated" });
    } catch (error) {
        console.error("Error updating thread:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const addReply = async (req, res) => {
    try {
        const { thread_id, content, author_id } = req.body;

        if (!thread_id || !content || !author_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newReply = await Reply.create({
            thread_id,
            content,
            author_id
        });

        await Thread.update({ last_reply_at: newReply.created_at }, { where: { thread_id } });

        res.status(201).json(newReply);
    } catch (error) {
        console.error("Error adding reply:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getReplies = async (req, res) => {
    try {
        const { threadId } = req.params;
        const replies = await Reply.findAll({
            where: { thread_id: threadId },
            include: [{ model: User, attributes: ['name'] }],
            order: [['created_at', 'ASC']]
        });

        const formattedReplies = replies.map(reply => ({
            id: reply.reply_id,
            threadId: reply.thread_id,
            content: reply.content,
            author: reply.User ? reply.User.name : "Unknown",
            createdAt: reply.created_at,
            likes: reply.likes
        }));

        res.status(200).json(formattedReplies);
    } catch (error) {
        console.error("Error fetching replies:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

const deleteThread = async (req, res) => {
    try {
        const { threadId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role;

        const thread = await Thread.findByPk(threadId);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        if (thread.author_id !== userId && userRole !== 'reviewer' && userRole !== 'admin') {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Thread.destroy({ where: { thread_id: threadId } });
        res.status(200).json({ message: "Thread deleted" });
    } catch (error) {
        console.error("Error deleting thread:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

const deleteReply = async (req, res) => {
    try {
        const { replyId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role;

        const reply = await Reply.findByPk(replyId);
        if (!reply) return res.status(404).json({ message: "Reply not found" });

        if (reply.author_id !== userId && userRole !== 'reviewer' && userRole !== 'admin') {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Reply.destroy({ where: { reply_id: replyId } });
        res.status(200).json({ message: "Reply deleted" });
    } catch (error) {
        console.error("Error deleting reply:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const user = await User.findOne({
            where: { user_id: userId },
            include: [{
                model: UserAuth,
                attributes: ['email']
            }],
            attributes: ['name', 'role', 'phone', 'rank', 'xp', 'created_at']
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userData = {
            ...user.toJSON(),
            email: user.UserAuth ? user.UserAuth.email : null
        };
        delete userData.UserAuth;

        res.status(200).json(userData);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export { flashCard, quizCard, discussionCard, createThread, updateThread, addReply, getReplies, deleteThread, deleteReply, getUserProfile };