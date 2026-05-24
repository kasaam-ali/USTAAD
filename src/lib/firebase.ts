// Firebase removed, using localStorage
export const db = {} as any;
export const storage = {} as any;
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    callback(null);
    return () => {};
  }
} as any;
