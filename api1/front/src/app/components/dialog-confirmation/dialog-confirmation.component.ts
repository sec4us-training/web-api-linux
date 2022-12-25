import { Component, Inject, OnInit } from "@angular/core";

import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-dialog-confirmation",
  templateUrl: "./dialog-confirmation.component.html",
  styleUrls: ["./dialog-confirmation.component.scss"],
})
export class DialogConfirmationComponent {
  title = "";
  message = "";
  primaryButton = {
    title: "",
    color: "",
  };
  secondaryButton = {
    title: "",
    color: "",
  };

  constructor(
    public dialogRef: MatDialogRef<DialogConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data?.title;
    this.message = data?.message;
    this.primaryButton = data?.primaryButton;
    this.secondaryButton = data?.secondaryButton;
  }

  onNoClick(): void {
    this.dialogRef.close(true);
  }
}
