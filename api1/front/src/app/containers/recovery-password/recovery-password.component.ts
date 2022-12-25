import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-reset-password",
  templateUrl: "./recovery-password.component.html",
  styleUrls: ["./recovery-password.component.scss"],
})
export class RecoveryPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.resetForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (!this.resetForm.valid) {
      console.error("Formulário INVÁLIDO", this.resetForm);
      return;
    }

    this.loading = true;

    const payload = {
      email: this.resetForm.value?.email,
    };

    this.authService.recoveryPassword(payload).subscribe(
      (res) => {
        this.loading = false;

        this.snackBar.open(res.message, "Ok", { duration: 3000 });

        setTimeout(() => {
          this.router.navigate(["/signin"]);
        }, 3000);
      },
      (err) => {
        this.loading = false;

        this.snackBar.open(err.error.message, "", { duration: 3000 });
      }
    );
  }
}
