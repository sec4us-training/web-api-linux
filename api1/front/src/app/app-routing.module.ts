import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { NewUserComponent } from "./containers/new-user/new-user.component";
import { SigninComponent } from "./containers/signin/signin.component";
import { UsersComponent } from "./containers/users/users.component";

import { AuthGuardService as AuthGuard } from "./auth/auth-guard.service";
import { HomeLayoutComponent } from "./layouts/home-layout/home-layout.component";
import { LoginLayoutComponent } from "./layouts/login-layout/login-layout.component";
import { RecoveryPasswordComponent } from "./containers/recovery-password/recovery-password.component";
import { UserComponent } from "./containers/user/user.component";

const routes: Routes = [
  {
    path: "",
    component: HomeLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: UserComponent,
      },
      {
        path: "user/:id",
        component: UserComponent,
      },
      {
        path: "create-user",
        component: NewUserComponent,
      },
      { path: "my-data", canActivate: [AuthGuard], component: UserComponent },
      { path: "users", canActivate: [AuthGuard], component: UsersComponent },
    ],
  },
  {
    path: "",
    component: LoginLayoutComponent,
    children: [
      {
        path: "signin",
        component: SigninComponent,
      },
      {
        path: "recovery-password",
        component: RecoveryPasswordComponent,
      },
    ],
  },
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
