import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/auth/auth.service";

import { SigninResponse } from "src/app/shared/models/signin-response";
import { UserService } from "src/app/shared/services/user.service";

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.scss"],
})
export class SigninComponent implements OnInit {
  emailForm!: FormGroup;
  passwordForm!: FormGroup;
  section = "email";
  userEmail = "";
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.emailForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
    });

    this.passwordForm = this.formBuilder.group({
      password: ["", [Validators.required]],
    });
  }

  onSubmitEmailForm(): void {
    if (!this.emailForm.valid) {
      console.error("Formulário INVÁLIDO", this.emailForm);
      return;
    }

    this.loading = true;
    const email = this.emailForm.value?.email;

    this.authService.verifyEmail(email).subscribe(
      (res) => {
        const { email_validated } = res;
        this.loading = false;

        console.log(email_validated);

        if (email_validated) {
          this.userEmail = this.emailForm.value?.email;
          this.section = "password";
        } else {
          const formControl = this.emailForm.get("email");
          formControl?.setErrors({
            serverError: "E-mail inválido",
          });
        }
      },
      (err) => {
        console.error(err);

        this.loading = false;

        const formControl = this.emailForm.get("email");
        formControl?.setErrors({
          serverError: err?.error?.message,
        });
      }
    );
  }

  backToEmailSection() {
    this.section = "email";
  }

  onSubmitPasswordForm(): void {
    if (!this.passwordForm.valid) {
      console.error("Formulário INVÁLIDO", this.passwordForm);
      return;
    }

    this.loading = true;

    const payload = {
      email: this.userEmail,
      password: this.passwordForm.value?.password,
    };

    this.authService.signin(payload).subscribe(
      (res) => {
        this.loading = false;
        const siginResponse: SigninResponse = res;

        localStorage.setItem("auth", siginResponse?.auth.toString());
        localStorage.setItem("jwt", siginResponse?.jwt);
        localStorage.setItem("id", siginResponse?.id);
        localStorage.setItem("email", siginResponse?.email);
        localStorage.setItem("name", siginResponse?.name);
        localStorage.setItem("photo", siginResponse?.photo);
        localStorage.setItem("phone", siginResponse?.phone);
        localStorage.setItem("role", siginResponse?.role);

        this.authService.authenticate();
        this.router.navigate(["/"]);
      },
      (err) => {
        console.error(err);
        this.loading = false;
        const formControl = this.passwordForm.get("password");

        formControl?.setErrors({
          serverError: err?.error?.message,
        });
      }
    );
  }
}
