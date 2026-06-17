function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    followingNgoIds: user.followingNgoIds || [],
    recentSearchTerms: user.recentSearchTerms || [],
  };
}

function serializeNgo(ngo) {
  if (!ngo) return null;
  const members = {};
  for (const member of ngo.members || []) {
    members[member.userId] = member.membershipRole;
  }

  return {
    ...ngo,
    goalAmount: Number(ngo.goalAmount || 0),
    raisedAmount: Number(ngo.raisedAmount || 0),
    members,
  };
}

function serializeDonation(donation) {
  return {
    ...donation,
    amount: Number(donation.amount || 0),
    userName: donation.user?.name || donation.user?.email || 'Anonymous',
    ngoName: donation.ngo?.name,
    cause: donation.ngo?.cause,
  };
}

module.exports = { asyncHandler, toPublicUser, serializeNgo, serializeDonation };
