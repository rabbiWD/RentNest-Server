export const notFound = (req, res) => {
    res.status(404).json({
        message: "Route not found",
        path: req.originalUrl,
        date: new Date()
    });
};
