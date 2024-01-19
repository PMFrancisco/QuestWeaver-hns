module.exports = {
    formatDate: (date) => {
      return new Date(date).toLocaleDateString();
    },
    capitalize: (text) => {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    checkGameStatus: (participants, userId) => {
        const participant = participants.find(p => p.userId === userId);
        if (!participant) {
          return { status: 'notJoined', isClickable: true };
        } else if (!participant.isAccepted) {
          return { status: 'pending', isClickable: false };
        } else {
          return { status: 'playing', isClickable: false };
        }
      },

      eq: (v1, v2) => v1 === v2,
      
  };
  