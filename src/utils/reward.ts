export const calculateRewardForNewFriend = (
  friendsCount: number,
): {
  money: number;
  lives: number;
} => {
  if (friendsCount <= 5) {
    return {
      money: 1500,
      lives: 1,
    };
  }

  if (friendsCount <= 10) {
    return {
      money: 3000,
      lives: 2,
    };
  }

  return {
    money: 5000,
    lives: 3,
  };
};
