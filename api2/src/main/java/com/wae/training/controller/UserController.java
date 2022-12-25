package com.wae.training.controller;

import com.wae.training.entity.User;
import com.wae.training.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.io.StringWriter;
import java.io.PrintWriter;

@RestController
public class UserController {

    @Autowired
    private UserService service;

    @Autowired
    private HttpServletRequest request;


    @RequestMapping(
        value = { 
            "/", 
            "/api/", 
            "/api/v1/" 
        }, 
        method = RequestMethod.GET)
    public ResponseEntity<?> genericGet() {

        Map<Object, Object> model = new HashMap<>();
        model.put("treinamento", "Treinamento Web API Exploitation");
        model.put("versao", "v1");
        model.put("copyright", "Copyright © Sec4US - Todos os direitos reservados. Nenhuma parte dos materiais disponibilizadas, incluindo esta API e seu código fonte, podem ser copiadas, publicadas, compartilhadas, redistribuídas, sublicenciadas, transmitidas, alteradas, comercializadas ou utilizadas para trabalhos sem a autorização por escrito da Sec4US");

        return new ResponseEntity<>(model, HttpStatus.OK);
    }


    @PostMapping("/api/v1/create")
    public User addUser(@RequestBody User user) {
        return service.saveUser(user);
    }

    @PostMapping("/api/v1/authenticate")
    public ResponseEntity<?> authUser(@RequestBody User user) {
        try{
            ResponseEntity resp;
            Map<Object, Object> model = new HashMap<>();

            String cpf = user.getCpf();
            String code = user.getCode();

            User usr = service.getUserByCpfCode(cpf, code);

            if (usr != null){
                String token = UserService.serialize(usr);

                HttpHeaders headers = new HttpHeaders();
                headers.add("Authorization", "Bearer " + token);
                
                model.put("success", true);

                resp = new ResponseEntity<>(model, headers, HttpStatus.OK);
                
            }else{
                model.put("success", false);
                model.put("message", "Usuário não encontrado!");

                resp = new ResponseEntity<>(model, HttpStatus.NOT_FOUND);
            }

            return resp;


        }catch(Exception e){
            return parseError(e);
        }
    }

    @RequestMapping("/api/v1/user/me")
    public ResponseEntity<?> findMe() {

        try{
            ResponseEntity resp;
            Map<Object, Object> model = new HashMap<>();

            String headerValue = request.getHeader("Authorization");
            if (headerValue != null && !headerValue.isEmpty())
            {

                String token = headerValue.substring(7);
                User user_token = UserService.deserialize(token);
                String cpf_token = user_token.getCpf();
                String code_token = user_token.getCode();

                User user_base = service.getUserByCpf(cpf_token);

                String cpf_base = user_base.getCpf();
                String code_base = user_base.getCode();

                boolean auth = false;
                if (cpf_token.equals(cpf_base) && code_token.equals(code_base)) { auth = true;}

                model.put("auth", auth);
                //model.put("id", user_base.getId());
                //model.put("cpf", user_base.getCpf());
                model.put("code", user_base.getCode());
                //model.put("name", user_base.getName());
                //model.put("email", user_base.getEmail());

                resp = new ResponseEntity<>(model, HttpStatus.OK);

            }else{
                model.put("success", false);
                model.put("message", "Cabeçalho 'Authorization' não encontrado");

                resp = new ResponseEntity<>(model, HttpStatus.NOT_FOUND);
            }

            //return service.getUserById(1);
            return resp;
        
        }catch(Exception e){
            return parseError(e);
        }
    }

    @RequestMapping("/api/v1/user/{code}")
    public ResponseEntity<?> findUserByCode(@PathVariable("code") String code) {

        try{
            ResponseEntity resp;
            Map<Object, Object> model = new HashMap<>();

            String headerValue = request.getHeader("Authorization");
            if (headerValue != null && !headerValue.isEmpty())
            {

                String token = headerValue.substring(7);
                User user_token = UserService.deserialize(token);
                String cpf_token = user_token.getCpf();
                String code_token = user_token.getCode();

                User user_base = service.getUserByCode(code);

                model.put("id", user_base.getId());
                model.put("cpf", user_base.getCpf());
                model.put("code", user_base.getCode());
                model.put("name", user_base.getName());
                model.put("email", user_base.getEmail());

                resp = new ResponseEntity<>(model, HttpStatus.OK);

            }else{
                model.put("success", false);
                model.put("message", "Cabeçalho 'Authorization' não encontrado");

                resp = new ResponseEntity<>(model, HttpStatus.NOT_FOUND);
            }

            //return service.getUserById(1);
            return resp;

        }catch(Exception e){
            return parseError(e);
        }
    }

    @PostMapping("/api/v1/recupera")
    public ResponseEntity<?> recoveryUser(@RequestBody User user) {

        try{
            ResponseEntity resp;
            Map<Object, Object> model = new HashMap<>();

            String cpf_body = user.getCpf();

            User user_base = service.getUserByCpf(cpf_body);

            if (user_base != null){
                model.put("success", true);
                model.put("code", user_base.getCode());
                model.put("email", user_base.getEmail());
                model.put("message", "E-mail enviado com sucesso");

                resp = new ResponseEntity<>(model, HttpStatus.OK);
                
            }else{
                model.put("success", false);
                model.put("message", "Usuário não encontrado!");

                resp = new ResponseEntity<>(model, HttpStatus.NOT_FOUND);
            }

            return resp;

        }catch(Exception e){
            return parseError(e);
        }

    }

    private ResponseEntity<?> parseError(Exception e) {
        ResponseEntity resp;
        Map<Object, Object> model = new HashMap<>();

        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        String sStackTrace = sw.toString(); // stack trace as a string
        System.out.println(sStackTrace);

        model.put("success", false);

        model.put("message",e.toString());
        model.put("trace",sStackTrace);

        return new ResponseEntity<>(model, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
