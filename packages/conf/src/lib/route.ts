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
    dashboard : "/admin",
    salons : {
      url : '/admin/salons',
      details : {
        url : '/admin/salons/details',
      },
      create : {
        url : '/admin/salons/create'
      }
    },
    users : "/admin/utilisateurs",
  },
};