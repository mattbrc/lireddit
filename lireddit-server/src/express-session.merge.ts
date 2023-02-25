declare module 'express-session' {
  interface Session {
      userId: any;
      // randomKey: string;
  }
}
export default 'express-session';