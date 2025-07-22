import shouldAccountBeActive from "./accountStatusChecker";

export const refetchAndValidateAccount = async (userId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch user info");

    const updatedUser = await response.json();
    await shouldAccountBeActive(updatedUser);
  } catch (error) {
    console.error("Refetching user failed:", error);
  }
};
