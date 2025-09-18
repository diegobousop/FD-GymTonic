package es.udc.fi.dc.fd.rest.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.services.ExerciseService;
import es.udc.fi.dc.fd.rest.dtos.ExerciseConversor;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;


@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private ExerciseService exerciseService;

    @PostMapping("/addExercise")
    public Long addProduct(@RequestBody ExerciseDto exercise){
 
        return exerciseService.addExercise(ExerciseConversor.toExercise(exercise));
    }
}
