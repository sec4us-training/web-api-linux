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
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";

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
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"],
})
export class UserComponent implements OnInit {
  userId!: string;
  title = "Meus dados";
  uploadContainerIsVisible = false;
  selectedFile!: File;
  user!: User;
  userForm!: FormGroup;
  genders = [
    { value: "male", viewValue: "Masculino" },
    { value: "female", viewValue: "Feminino" },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const paramUserId = params?.id;

      this.userId = !paramUserId
        ? localStorage.getItem("id") || ""
        : paramUserId;

      this.userService.getUser(this.userId).subscribe(
        (res) => {
          this.user = res;

          if (paramUserId) {
            this.title = this.user.name;
          }

          this.userForm = this.formBuilder.group(
            {
              name: [this.user?.name, [Validators.required]],
              email: [
                this.user?.email,
                [Validators.required, Validators.email],
              ],
              document: [this.user?.document],
              birth_date: [this.user?.birth_date, [Validators.required]],
              gender: [this.user?.gender, [Validators.required]],
              phone: [this.user?.phone],
              old_password: [""],
              new_password: [""],
              conf_new_password: [""],
            },
            { validator: this.checkPasswords }
          );
        },
        (err) =>
          this.snackBar.open(err?.error?.message, "OK", { duration: 3000 })
      );
    });
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

    const file = this.selectedFile;
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      this.userService.uploadPhoto(this.userId, { file: reader?.result }).subscribe(
        (res) =>
          this.snackBar.open(res.message, "OK", {
            duration: 3000,
          }),
        (err) =>
          this.snackBar.open(err.error.message, "OK", {
            duration: 3000,
          })
      );
    };
    reader.onerror = (error) => {
      console.error(error);
      this.snackBar.open("Erro ao carregar imagem", "OK", { duration: 3000 });
    };

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

    const date = new Date(this.userForm.value?.birth_date);

    this.userService
      .updateUser(this.userId, {
        name: this.userForm.value?.name,
        email: this.userForm.value?.email,
        phone: this.userForm.value?.phone,
        old_password: this.userForm.value?.old_password,
        new_password: this.userForm.value?.new_password,
        conf_new_password: this.userForm.value?.conf_new_password,
        // photo
      })
      .subscribe(
        (res) => {
          this.snackBar.open(res.message, "OK", {
            duration: 3000,
          });

          const user: User = res?.user;

          this.userForm.value.name = user.name;
          this.userForm.value.email = user.email;
          this.userForm.value.phone = user.phone;
        },
        (err) =>
          this.snackBar.open(err?.error?.message, "OK", { duration: 3000 })
      );
  }

  checkPasswords(group: FormGroup): null | object {
    const pass = group.get("new_password")?.value;
    const confirmPass = group.get("conf_new_password")?.value;

    return pass === confirmPass ? null : { notSame: true };
  }
}
