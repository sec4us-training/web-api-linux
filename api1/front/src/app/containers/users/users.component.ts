import { Component, OnInit } from "@angular/core";
import { User } from "src/app/shared/models/user";
import { UserService } from "src/app/shared/services/user.service";

import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
  users!: User[];
  displayedColumns: string[] = [
    "name",
    "email",
    "phone",
    "document",
    "gender",
    "birth_date",
  ];

  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    const role = localStorage.getItem("role");

    if (role !== "admin") {
      this.router.navigate(["/"]);
    }

    this.getUsers();
  }

  editUser(user: User): void {
    // TODO: abrir dialog para editar usuário
  }

  getUsers(): void {
    this.userService.getUsers().subscribe((users) => (this.users = users));
  }
}
