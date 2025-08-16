export const protectedRoutes = [
  "/dashboard",
  "/salons",
  "/salons/details",
  "/users",
]


export const authRoutes = [
  "/auth/login",
]


export const publicRoutes = [];


export const Routes = {
  auth : {
    login : "/auth/login",
  },
  protected : {
    dashboard : "/",
    salons : {
      url : '/salons',
      details : {
        url : '/salons/details',
      },
      create : {
        url : '/salons/create'
      }
    },
    users : "/users",
  },
  
};