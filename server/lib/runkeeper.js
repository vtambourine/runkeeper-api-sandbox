var Runkeeper = {
    parseUser(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            throw new Error('Error in parsing user data.');
        }
    },

    parseProfile(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            throw new Error('Error in parsing profile.');
        }
    },

    parseFitnessActivity(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            throw new Error('Error in parsing fitness activity.');
        }
    }
};

export default Runkeeper;
