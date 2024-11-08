const User = require("../models/userModel");
const Wallet = require("../models/walletModel");

module.exports.createWallet = async (req, res) => {
    try {
        const { userId } = req.body;

        const existingWallet = await Wallet.findOne({ userId });
        if (existingWallet) {
            return res.status(400).json({
                success: false,
                message: "Wallet already exist for this user"
            })
        }

        // create new user: 
        const wallet = new Wallet({
            userId
        })
        await wallet.save();

        return res.status(201).json({
            success: true,
            message: "Wallet created successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get my wallet: 
module.exports.getMyWallet = async (req, res) => {
    try {
        const userId = req.user._id;
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "No wallet found for the user"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Your wallet fetched",
            wallet
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Credit wallet: 
module.exports.creditWallet = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount } = req.body;

        // console.log("user id: ", userId)
        if (amount < 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0"
            })
        }

        // find wallet: 
        const wallet = await Wallet.findOne({ userId: userId });
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "No wallet found for the user"
            })
        }

        wallet.balance = Number(wallet.balance) + Number(amount);
        wallet.transactionHistory.push({ transactionType: 'Credit', amount: Number(amount) });
        await wallet.save();

        return res.status(200).json({
            success: true,
            message: "Wallet credited successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Debit wallet: 
module.exports.debitWallet = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount } = req.body;
        // console.log("user id: ", userId);
        if (amount < 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0"
            })
        }

        // find wallet: 
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "No wallet found for the user"
            })
        }

        wallet.balance -= amount;
        wallet.transactionHistory.push({ transactionType: 'Debit', amount });
        await wallet.save();

        return res.status(200).json({
            success: true,
            message: "Wallet debited successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// Get transaction history: 
module.exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        // console.log(userId);
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found.."
            })
        }
        return res.status(200).json({
            success: true,
            message: "Transactions fetched!!",
            transactionHistory: wallet.transactionHistory,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}