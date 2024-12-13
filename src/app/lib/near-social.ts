
export async function lookupTwitterHandle(accountId: string): Promise<string | null> {
  const response = await fetch("https://api.near.social/get", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      keys: [`${accountId}/profile/**`],
    }),
  });

  const data = await response.json();
  const twitterHandleRaw = data[accountId]?.profile?.linktree?.twitter;

  if (twitterHandleRaw) {
    // Remove unwanted patterns and characters
    const sanitizedHandle = twitterHandleRaw
      .replace(/^(https?:\/\/)?(www\.)?twitter\.com\//, "") // Remove URL prefixes
      .replace(/[^a-zA-Z0-9_]/g, "") // Remove invalid characters
      .substring(0, 15); // Enforce max length of 15 characters

    return `@${sanitizedHandle}`;
  } else {
    return null;
  }
}