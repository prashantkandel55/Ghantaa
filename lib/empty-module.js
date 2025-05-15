// This is an empty module to replace server-only imports
module.exports = {
  cookies: () => ({
    get: () => null,
    set: () => {},
    delete: () => {},
  }),
  revalidatePath: () => {},
  revalidateTag: () => {},
  redirect: () => {},
  headers: () => ({}),
  createServerClient: () => ({}),
}
