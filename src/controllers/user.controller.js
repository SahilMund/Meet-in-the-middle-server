
export const getUserInfo = async (req, res) => {
    // Assuming req.user is set by the isLoggedIn middleware
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Return user information
    return res.status(200).json({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role, // Assuming role is part of the user object
    });
}