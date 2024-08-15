/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the game
 *         imageURL:
 *           type: string
 *           description: The URL of the game's image
 *         createdAt:
 *           type: number
 *           description: The timestamp when the game was created
 *       required:
 *         - title
 *         - imageURL
 *         - createdAt
 *
 *     GameDoc:
 *       allOf:
 *         - $ref: '#/components/schemas/Game'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The ID of the game (inherited from Document)
 *           required:
 *             - _id
 *
 *     Play:
 *       type: object
 *       properties:
 *         game:
 *           $ref: '#/components/schemas/GameDoc'
 *           description: The game being played
 *         user:
 *           $ref: '#/components/schemas/UserDoc'
 *           description: The user playing the game
 *         score:
 *           type: number
 *           description: The score achieved in the game
 *         createdAt:
 *           type: number
 *           description: The timestamp when the play session was created
 *       required:
 *         - game
 *         - user
 *         - score
 *         - createdAt
 *
 *     PlayDoc:
 *       allOf:
 *         - $ref: '#/components/schemas/Play'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The ID of the play session (inherited from Document)
 *           required:
 *             - _id
 *
 *     ReferralDoc:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the referral (inherited from Document)
 *         user:
 *           $ref: '#/components/schemas/UserDoc'
 *           description: The user who referred someone
 *         joined:
 *           $ref: '#/components/schemas/UserDoc'
 *           description: The user who joined through the referral
 *         claimed:
 *           type: number
 *           description: The number of rewards claimed
 *         earned:
 *           type: number
 *           description: The amount earned through referrals
 *         createdAt:
 *           type: number
 *           description: The timestamp when the referral was created
 *       required:
 *         - _id
 *         - user
 *         - joined
 *         - claimed
 *         - earned
 *         - createdAt
 *
 *     ReferralsPagination:
 *       type: object
 *       properties:
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReferralDoc'
 *         meta:
 *           type: object
 *           properties:
 *             offset:
 *               type: number
 *             limit:
 *               type: number
 *             total:
 *               type: number
 *       required:
 *         - results
 *         - meta
 *
 *     Reward:
 *       type: object
 *       properties:
 *         repeatRules:
 *           type: object
 *           properties:
 *             daily:
 *               type: boolean
 *               description: Whether the reward repeats daily
 *         money:
 *           type: number
 *           description: The amount of money rewarded
 *         lives:
 *           type: number
 *           description: The number of lives rewarded
 *         createdAt:
 *           type: number
 *           description: The timestamp when the reward was created
 *         rewardType:
 *           type: string
 *           enum: ['achievement', 'social', 'gyroscope']
 *           description: The type of reward
 *         minScore:
 *           type: number
 *           description: The minimum score required for the reward (for 'achievement' rewards)
 *         subscription:
 *           type: string
 *           description: The subscription required for the reward (for 'social' rewards)
 *       required:
 *         - createdAt
 *         - rewardType
 *
 *     RewardDoc:
 *       allOf:
 *         - $ref: '#/components/schemas/Reward'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The ID of the reward (inherited from Document)
 *           required:
 *             - _id
 *
 *     UserDoc:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the user (inherited from Document)
 *         lives:
 *           type: number
 *           description: The number of lives the user has
 *         referrals:
 *           type: number
 *           description: The number of referrals the user has made
 *         isKol:
 *           type: boolean
 *           description: Whether the user is a key opinion leader (KOL)
 *         telegramId:
 *           type: number
 *           description: The user's Telegram ID
 *         username:
 *           type: string
 *           description: The user's username
 *         inviteLinkParam:
 *           type: string
 *           description: The invite link parameter for the user
 *         imageURL:
 *           type: string
 *           description: The URL of the user's image
 *         language:
 *           type: string
 *           description: The user's preferred language
 *         activity:
 *           type: object
 *           properties:
 *             streak:
 *               type: object
 *               properties:
 *                 amount:
 *                   type: number
 *                   description: The number of days in the streak
 *                 days:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The days of the streak
 *                 updatedAt:
 *                   type: number
 *                   description: The timestamp when the streak was last updated
 *         earnings:
 *           type: number
 *           description: The user's earnings
 *         friendsEarnings:
 *           type: object
 *           properties:
 *             count:
 *               type: number
 *               description: The number of friends who have earned money
 *             money:
 *               type: number
 *               description: The amount of money earned from friends
 *             lives:
 *               type: number
 *               description: The number of lives earned from friends
 *         claimedRewards:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               reward:
 *                 $ref: '#/components/schemas/RewardDoc'
 *               createdAt:
 *                 type: number
 *                 description: The timestamp when the reward was claimed
 *         lastVisit:
 *           type: number
 *           description: The timestamp when the user last visited
 *         lastNotification:
 *           type: number
 *           description: The timestamp when the user last received a notification
 *         createdAt:
 *           type: number
 *           description: The timestamp when the user was created
 *       required:
 *         - _id
 *         - lives
 *         - referrals
 *         - isKol
 *         - telegramId
 *         - username
 *         - inviteLinkParam
 *         - imageURL
 *         - language
 *         - activity
 *         - earnings
 *         - friendsEarnings
 *         - claimedRewards
 *         - lastVisit
 *         - lastNotification
 *         - createdAt
 *
 *     UserView:
 *       type: object
 *       properties:
 *         referrals:
 *           type: number
 *           description: The number of referrals the user has made
 *         isKol:
 *           type: boolean
 *           description: Whether the user is a key opinion leader (KOL)
 *         username:
 *           type: string
 *           description: The user's username
 *         imageURL:
 *           type: string
 *           description: The URL of the user's image
 *         inviteLinkParam:
 *           type: string
 *           description: The invite link parameter for the user
 *         language:
 *           type: string
 *           description: The user's preferred language
 *         activity:
 *           type: object
 *           properties:
 *             streak:
 *               type: object
 *               properties:
 *                 amount:
 *                   type: number
 *                   description: The number of days in the streak
 *                 days:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The days of the streak
 *                 updatedAt:
 *                   type: number
 *                   description: The timestamp when the streak was last updated
 *         lives:
 *           type: number
 *           description: The number of lives the user has
 *         earnings:
 *           type: number
 *           description: The user's earnings
 *         friendsEarnings:
 *           type: object
 *           properties:
 *             count:
 *               type: number
 *               description: The number of friends who have earned money
 *             money:
 *               type: number
 *               description: The amount of money earned from friends
 *             lives:
 *               type: number
 *               description: The number of lives earned from friends
 *         claimedRewards:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               reward:
 *                 $ref: '#/components/schemas/RewardDoc'
 *               createdAt:
 *                 type: number
 *                 description: The timestamp when the reward was claimed
 *         createdAt:
 *           type: number
 *           description: The timestamp when the user was created
 *       required:
 *         - referrals
 *         - isKol
 *         - username
 *         - imageURL
 *
 *     UserEarningsView:
 *       type: object
 *       properties:
 *         earnings:
 *           type: number
 *           description: The user's updated earnings
 *       required:
 *         - earnings
 *
 *     Leaderboard:
 *       type: object
 *       properties:
 *         leaderboard:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 $ref: '#/components/schemas/UserDoc'
 *                 description: The user on the leaderboard
 *               score:
 *                 type: number
 *                 description: The score of the user
 *               rank:
 *                 type: number
 *                 description: The rank of the user
 *         userRank:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/UserDoc'
 *               description: The current user, or null if not on the leaderboard
 *             score:
 *               type: number
 *               description: The current user's score, or null if not on the leaderboard
 *             rank:
 *               type: number
 *               description: The current user's rank, or null if not on the leaderboard
 *       required:
 *         - leaderboard
 *         - userRank
 */
