// Get user by reference number
export const getUserInfoByReferenceNumber = (referenceNumber, allUserInfo) => {
  if (!allUserInfo) return referenceNumber;

  const user = allUserInfo.find(
    (user) => user.reference_number === referenceNumber
  );
  return user;
};
