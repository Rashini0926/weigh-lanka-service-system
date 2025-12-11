package com.weighlanka.backend.dto;

public class ResetPasswordRequest {

    private String password;

    public ResetPasswordRequest() {}

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
