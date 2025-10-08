package es.udc.fi.dc.fd.rest.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.services.ExerciseService;
import es.udc.fi.dc.fd.rest.dtos.BlockDto;
import es.udc.fi.dc.fd.rest.dtos.ExerciseConversor;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;
import es.udc.fi.dc.fd.model.services.Block;
import es.udc.fi.dc.fd.model.entities.Exercise;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private ExerciseService exerciseService;

    @PostMapping("/addExercise")
    public Long addProduct(@RequestAttribute Long userId,@RequestBody ExerciseDto exercise) throws DuplicateInstanceException{
 
        return exerciseService.addExercise(userId, ExerciseConversor.toExercise(exercise));
    }

    @GetMapping("/getExercises")
    public BlockDto<ExerciseDto> getExercises(@RequestParam(defaultValue = "0") int page){
        Block<Exercise> returned = exerciseService.getExercices(page, 5);
        
        return new BlockDto<>(ExerciseConversor.toExerciseDtos(returned.getItems()), returned.getExistMoreItems());
    }    
}
