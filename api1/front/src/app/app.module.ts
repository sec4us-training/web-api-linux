import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LayoutModule } from "@angular/cdk/layout";

import { UsersComponent } from "./containers/users/users.component";
import { SigninComponent } from "./containers/signin/signin.component";
import { NewUserComponent } from "./containers/new-user/new-user.component";

import { NavigationComponent } from "./shared/navigation/navigation.component";

import { ToolbarComponent } from "./components/toolbar/toolbar.component";

import { MatInputModule } from "@angular/material/input";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { MatDialogModule } from "@angular/material/dialog";
import {
  MatProgressSpinnerModule,
  MatSpinner,
} from "@angular/material/progress-spinner";

import {
  ErrorStateMatcher,
  MatNativeDateModule,
  MAT_DATE_LOCALE,
  ShowOnDirtyErrorStateMatcher,
} from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";

import { FlexLayoutModule } from "@angular/flex-layout";
import { NgxMaskModule, IConfig } from "ngx-mask";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { DialogConfirmationComponent } from "./components/dialog-confirmation/dialog-confirmation.component";
import { AuthGuardService } from "./auth/auth-guard.service";
import { HomeLayoutComponent } from "./layouts/home-layout/home-layout.component";
import { LoginLayoutComponent } from "./layouts/login-layout/login-layout.component";
import { RecoveryPasswordComponent } from "./containers/recovery-password/recovery-password.component";
import { AuthInterceptor } from "./auth/auth-interceptor.service";
import { UserComponent } from "./containers/user/user.component";

// export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

const maskConfig: Partial<IConfig> = {
  validation: true,
};

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    UsersComponent,
    SigninComponent,
    ToolbarComponent,
    NewUserComponent,
    DialogConfirmationComponent,
    HomeLayoutComponent,
    LoginLayoutComponent,
    RecoveryPasswordComponent,
    UserComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    HttpClientModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatSnackBarModule,
    MatTableModule,
    NgxMaskModule.forRoot(maskConfig),
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    { provide: MAT_DATE_LOCALE, useValue: "pt-BR" },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AuthGuardService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
