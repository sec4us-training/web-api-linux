package com.wae.training.service;

import com.wae.training.entity.User;
import com.wae.training.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.Base64;
import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository repository;

    public User saveUser(User user) {
        return repository.save(user);
    }

    public List<User> saveUsers(List<User> users) {
        return repository.saveAll(users);
    }

    public List<User> getUsers() {
        return repository.findAll();
    }

    public User getUserById(int id) {
        return repository.findById(id).orElse(null);
    }

    public User getUserByCode(String code) {
        return repository.findByCode(code);
    }

    public User getUserByName(String name) {
        return repository.findByName(name);
    }

    public User getUserByCpf(String cpf) {
        return repository.findByCpf(cpf);
    }

    public User getUserByCpfCode(String cpf, String code) {

        if (cpf == null || cpf.isEmpty() || code == null || code.isEmpty())
            return null;

        User u = repository.findByCode(code);
        if (u != null){
            if (u.getCpf().substring(0,3).equals(cpf.substring(0,3)))
                return u;
            else
                return null;
        }
        return null;
    }

    public String deleteUser(int id) {
        repository.deleteById(id);
        return "user removed !! " + id;
    }

    public User updateUser(User user) {
        User existingUser = repository.findById(user.getId()).orElse(null);
        existingUser.setCpf(user.getCpf());
        existingUser.setCode(user.getCode());
        existingUser.setName(user.getName());
        existingUser.setEmail(user.getEmail());
        return repository.save(existingUser);
    }

    public static String serialize(User u) throws Exception {
        try{
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(baos);
            oos.writeObject(u);
            oos.close();
            return Base64.getEncoder().encodeToString(baos.toByteArray());
        }
        catch(Exception e){
            //e.printStackTrace();
            //return "";
            throw e;
            
        }
    }

    public static User deserialize(String base64Data) throws Exception  {
        try{

            ByteArrayInputStream bais = new ByteArrayInputStream(Base64.getDecoder().decode(base64Data));
            ObjectInputStream ois = new ObjectInputStream(bais);
            User u = (User)ois.readObject();
            ois.close();

            return u;
        }
        catch(Exception e){
            //e.printStackTrace();
            //return null;
            throw e;
            
        }

    }

}
