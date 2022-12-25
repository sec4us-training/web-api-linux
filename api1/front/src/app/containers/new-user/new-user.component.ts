import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm,
  FormBuilder,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { User } from "src/app/shared/models/user";
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
  selector: "app-new-user",
  templateUrl: "./new-user.component.html",
  styleUrls: ["./new-user.component.scss"],
})
export class NewUserComponent implements OnInit {
  userForm!: FormGroup;
  uploadContainerIsVisible = false;
  selectedFile!: File;

  genders = [
    { value: "male", viewValue: "Masculino" },
    { value: "female", viewValue: "Feminino" },
  ];

  roles = [
    { value: "user", viewValue: "Usuário" },
    { value: "admin", viewValue: "Administrador" },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    const role = localStorage.getItem("role");

    if (role !== "admin") {
      this.router.navigate(["/"]);
    }

    this.userForm = this.formBuilder.group(
      {
        name: ["", [Validators.required]],
        email: ["", [Validators.required, Validators.email]],
        document: [""],
        phone: [""],
        gender: ["", [Validators.required]],
        role: ["", [Validators.required]],
        birth_date: [""],
        password: ["", [Validators.required]],
        conf_password: [""],
      },
      { validator: this.checkPasswords }
    );
  }

  checkPasswords(group: FormGroup): null | object {
    const pass = group.get("password")?.value;
    const confirmPass = group.get("conf_password")?.value;

    return pass === confirmPass ? null : { notSame: true };
  }

  onFileChanged(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onUpload(): void {
    /**
     * TODO:
     * - seta o botão com ícone de loading
     * - salvar foto no back
     * - pegar a URL que o back irá retornar, aonde a imagem foi salva
     * - atribuir a variável de imagem e exibir no campo de foto
     * - loading false
     * - chamar o snackbar confirmando o salvamento da foto
     */

    this.snackBar.open("Imagem salva com sucesso", "OK", {
      duration: 2000,
    });

    setTimeout(() => {
      this.uploadContainerIsVisible = false;
    }, 2000);
  }

  onSubmit(): void {
    if (!this.userForm.valid) {
      this.snackBar.open("Verifique os dados do fomlário", "OK", {
          duration: 3000,
      });
      //console.error("Formulário INVÁLIDO", this.userForm);
      return;
    }

    const user: User = {
      email: this.userForm.value?.email,
      name: this.userForm.value?.name,
      // photo
      phone: this.userForm.value?.phone,
      password: this.userForm.value?.password,
      conf_password: this.userForm.value?.conf_password,
      birth_date: new Date(this.userForm.value?.birth_date).toISOString(),
      document: this.userForm.value?.document,
      gender: this.userForm.value?.gender,
      role: this.userForm.value?.role,
    };

    this.userService.createUser(user).subscribe(
      res => {
        this.snackBar.open(res.message, "OK", {
          duration: 3000,
        });

        setTimeout(() => {
          this.router.navigate(["/users"]);
        }, 3000);
      },
      err => {
        this.snackBar.open(err.error.message, "OK", {
          duration: 3000,
        });
      }
    );

    /**
     * TODO
     *
     * - chamar endpoint /create enviando o novo usuário [1h]
     * - exibir toast e redirecionar para /users [20m]
     */
  }
}
