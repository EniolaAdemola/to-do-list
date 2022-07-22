
// Export a particular function
exports.getDate  = () => {

	// options take in some default param xheck out docs on MDN
	const options = {
		weekday: "long",
		month: "long",
		day: "numeric",
	};
	const today = new Date();
	return today.toLocaleDateString("en-US", options);
	
};