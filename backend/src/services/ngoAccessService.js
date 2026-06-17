const { prisma } = require('../prisma/client');

async function canManageNgo(user, ngoId) {
  if (['admin', 'superadmin'].includes(user.role)) return true;
  const member = await prisma.ngoMember.findUnique({
    where: { userId_ngoId: { userId: user.id, ngoId } },
  });
  return Boolean(member && ['owner', 'manager'].includes(member.membershipRole));
}

async function isNgoOwner(user, ngoId) {
  if (user.role === 'superadmin') return true;
  const member = await prisma.ngoMember.findUnique({
    where: { userId_ngoId: { userId: user.id, ngoId } },
  });
  return member?.membershipRole === 'owner';
}

module.exports = { canManageNgo, isNgoOwner };
