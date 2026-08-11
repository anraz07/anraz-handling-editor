/**
 * Simple wrapper for fetching NUI callbacks from the client
 * @param eventName - The endpoint of the NUI callback
 * @param data - The data payload
 * @returns A promise of the parsed JSON response
 */
export async function fetchNui<T = any>(
  eventName: string,
  data?: any,
): Promise<T> {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data || {}),
  }

  const resourceName = (window as any).GetParentResourceName
    ? (window as any).GetParentResourceName()
    : "anraz-handling-editor"

  try {
    const resp = await fetch(`https://${resourceName}/${eventName}`, options)
    return await resp.json()
  } catch (err) {
    console.error(`[fetchNui] Error sending message to ${eventName}:`, err)
    throw err
  }
}
