package com.wae.training.repository;

import com.wae.training.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Integer> {
    User findByName(String name);

    User findByCpf(String cpf);

    User findByCode(String code);
}

