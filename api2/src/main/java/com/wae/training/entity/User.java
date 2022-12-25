package com.wae.training.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User implements Serializable {

    @Id
    @GeneratedValue
    private int id;
    private String cpf;
    private String code;
    private String name;
    private String email;

    public User(String cpf, String code) {
        this.cpf = cpf;
        this.code = code;
    }


  public String getCpf() {
    return this.cpf;
  }
  
  public int getId() {
    return this.id;
  }
  
  public String getCode() {
    return this.code;
  }
  
}
