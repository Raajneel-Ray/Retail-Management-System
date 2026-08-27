package com.Retail_Management.Backend.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**Purpose: The GlobalExceptionHandler is responsible for handling exceptions globally across all controllers.
 * It ensures that the application responds with meaningful error messages when an exception occurs,
 * improving the user experience and maintaining consistent error handling.**/

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleJsonParseException(HttpMessageNotReadableException ex) {
        Map<String,Object> map=new HashMap<>();
        map.put("message","Invalid input: The data provided is not valid.");
        return map;
    }
}
