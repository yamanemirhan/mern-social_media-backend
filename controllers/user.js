const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const Fuse = require("fuse.js");
const Story = require("../models/Story");

const getUser = async (req, res, next) => {
  try {
    const { id } = req.user;
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const user = await User.findById(id)
      .populate({
        path: "stories",
        match: { createdAt: { $gte: oneDayAgo } },
        select: "image createdAt viewers",
        populate: {
          path: "viewers",
          select: "name profilePicture",
        },
      })
      .populate({
        path: "followings",
        select: "name profilePicture stories private followers followings",
        populate: {
          path: "stories",
          match: { createdAt: { $gte: oneDayAgo } },
          select: "image createdAt viewers",
          populate: {
            path: "viewers",
            select: "name",
          },
        },
      });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getSearchUserNames = async (req, res, next) => {
  try {
    const searchTerm = req.params.search;
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const users = await User.find()
      .select(
        "_id name profilePicture stories private followers followerRequests sentRequests"
      )
      .populate({
        path: "stories",
        match: { createdAt: { $gte: oneDayAgo } },
        select: "image createdAt viewers",
      })
      .exec();

    const fuseOptions = {
      keys: ["name"],
      includeScore: true,
      threshold: 0.65,
    };

    const fuse = new Fuse(users, fuseOptions);
    const searchResults = fuse.search(searchTerm);
    const filteredResults = searchResults.map((result) => result.item);

    // Filter out the user with your own ID
    const userId = req.user.id;
    const filteredWithoutCurrentUser = filteredResults.filter(
      (user) => user._id.toString() !== userId
    );

    res.status(200).json({
      success: true,
      data: filteredWithoutCurrentUser,
    });
  } catch (error) {
    next(error);
  }
};

const follow = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return next(new CustomError("You cannot follow yourself.", 400));
    }

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const user = await User.findById(id).populate({
      path: "stories",
      match: { createdAt: { $gte: oneDayAgo } },
      select: "image createdAt viewers",
    });

    if (
      user.followerRequests.includes(req.user.id) ||
      user.followers.includes(req.user.id)
    ) {
      return next(
        new CustomError(
          "You have already sent a follow request to this user.",
          400
        )
      );
    }

    if (user.private) {
      user.followerRequests.push(req.user.id);
      await user.save();

      const requestingUser = await User.findById(req.user.id);
      requestingUser.sentRequests.push(user._id);
      await requestingUser.save();

      return res.status(200).json({
        success: true,
        data: {
          user: {
            _id: user._id,
            private: user.private,
          },
        },
      });
    }

    const requestingUser = await User.findById(req.user.id);
    requestingUser.followings.push(user._id);
    await requestingUser.save();
    user.followers.push(req.user.id);
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user.id,
          private: user.private,
          name: user.name,
          profilePicture: user.profilePicture,
          stories: user.stories,
          private: user.private,
          followers: user.followers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const unfollow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (id === userId) {
      return next(new CustomError("You cannot unfollow yourself.", 400));
    }

    const user = await User.findById(id);

    if (!user) {
      return next(new CustomError("User not found.", 404));
    }
    if (!user.followers.includes(userId)) {
      return next(new CustomError("You are not following this user.", 400));
    }

    user.followers.pull(userId);
    await user.save();

    const userToUnfollow = await User.findById(userId);
    userToUnfollow.followings.pull(id);
    await userToUnfollow.save();

    res
      .status(200)
      .json({ success: true, message: "Unfollowed successfully." });
  } catch (error) {
    next(error);
  }
};

const cancelFollowRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);

    if (!user.sentRequests.includes(id)) {
      return next(new CustomError("Follow request not found.", 400));
    }

    const friend = await User.findById(id);

    const followRequestIndex = user.sentRequests.indexOf(id);
    if (followRequestIndex !== -1) {
      user.sentRequests.splice(followRequestIndex, 1);
    }
    await user.save();

    const friendRequestIndex = friend.followerRequests.indexOf(req.user.id);
    if (friendRequestIndex !== -1) {
      friend.followerRequests.splice(friendRequestIndex, 1);
    }
    await friend.save();

    return res.status(200).json({
      success: true,
      data: user.sentRequests,
    });
  } catch (error) {
    next(error);
  }
};

const acceptFollowRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);

    if (!user.followerRequests.includes(id)) {
      return next(new CustomError("Follower request not found.", 400));
    }

    const friend = await User.findById(id);

    user.followers.push(friend._id);
    const friendRequestIndex = user.followerRequests.indexOf(id);

    if (friendRequestIndex !== -1) {
      user.followerRequests.splice(friendRequestIndex, 1);
    }
    await user.save();

    friend.followings.push(req.user.id);
    const followRequestIndex = friend.sentRequests.indexOf(req.user.id);
    if (followRequestIndex !== -1) {
      friend.sentRequests.splice(followRequestIndex, 1);
    }
    await friend.save();

    return res.status(200).json({
      success: true,
      data: {
        followerRequests: user.followerRequests,
        followers: user.followers,
      },
    });
  } catch (error) {
    next(error);
  }
};

const dismissFollowRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);

    if (!user.followerRequests.includes(id)) {
      return next(new CustomError("Follow request not found.", 400));
    }
    const friend = await User.findById(id);

    const friendRequestIndex = user.followerRequests.indexOf(id);
    if (friendRequestIndex !== -1) {
      user.followerRequests.splice(friendRequestIndex, 1);
    }
    await user.save();

    const followRequestIndex = friend.sentRequests.indexOf(req.user.id);
    if (followRequestIndex !== -1) {
      friend.sentRequests.splice(followRequestIndex, 1);
    }
    await friend.save();

    return res.status(200).json({
      success: true,
      data: user.followerRequests,
    });
  } catch (error) {
    next(error);
  }
};

const editProfile = async (req, res, next) => {
  try {
    const info = JSON.parse(req.body.info);
    const id = req.user.id;

    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    if (info.name) {
      user.name = info.name;
    }
    if (req.savedImages && req.savedImages[0]) {
      user.profilePicture = req.savedImages[0];
    }
    user.private = info.private;

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        name: user.name,
        profilePicture: user.profilePicture,
        private: user.private,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const followerUsers = await User.findById(id).populate({
      path: "followers",
      select:
        "_id name profilePicture stories private followers sentRequests followerRequests",
      populate: {
        path: "stories",
        match: { createdAt: { $gte: oneDayAgo } },
        select: "image createdAt viewers _id",
      },
    });

    return res.status(200).json({
      success: true,
      data: followerUsers.followers,
    });
  } catch (error) {
    next(error);
  }
};

const getFollowings = async (req, res, next) => {
  try {
    const { id } = req.params;

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const followingUsers = await User.findById(id).populate({
      path: "followings",
      select:
        "_id name profilePicture stories private followers sentRequests followerRequests",
      populate: {
        path: "stories",
        match: { createdAt: { $gte: oneDayAgo } },
        select: "image createdAt viewers _id",
      },
    });

    return res.status(200).json({
      success: true,
      data: followingUsers.followings,
    });
  } catch (error) {
    next(error);
  }
};

const getSentRequests = async (req, res, next) => {
  try {
    const { id } = req.user;

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const user = await User.findById(id)
      .populate({
        path: "sentRequests",
        select:
          "name profilePicture stories private followers sentRequests followerRequests",
        populate: {
          path: "stories",
          match: { createdAt: { $gte: oneDayAgo } },
          select: "image createdAt viewers",
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      data: user.sentRequests,
    });
  } catch (error) {
    next(error);
  }
};

const getFollowerRequests = async (req, res, next) => {
  try {
    const { id } = req.user;

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const user = await User.findById(id)
      .populate({
        path: "followerRequests",
        select:
          "name profilePicture stories private followers sentRequests followerRequests",
        populate: {
          path: "stories",
          match: { createdAt: { $gte: oneDayAgo } },
          select: "image createdAt viewers",
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      data: user.followerRequests,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUser,
  getSearchUserNames,
  follow,
  unfollow,
  cancelFollowRequest,
  acceptFollowRequest,
  dismissFollowRequest,
  editProfile,
  getFollowers,
  getFollowings,
  getSentRequests,
  getFollowerRequests,
};
