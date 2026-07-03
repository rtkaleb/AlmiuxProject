package org.generation.ALMIUX.exceptions;

public class UserNotFoundException extends RuntimeException{
    public UserNotFoundException(String username){
        super("Not found user with username: " + username);
    }

    public UserNotFoundException(Long id) {
        super("Not found user with id: " + id);
    }

    public UserNotFoundException(String field, String value){
        super("Not found user with " + field + ": " + value);
    }

}
