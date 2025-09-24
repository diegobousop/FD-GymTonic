package es.udc.fi.dc.fd.rest;

import static org.junit.Assert.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;


import es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular;
import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;

import es.udc.fi.dc.fd.rest.controllers.AdminController;

import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;

/**
 * The Class UserControllerTest.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AdminControllerTest {
    
    @Autowired
    private AdminController adminController;

    @Test
    public void testPostAddExercise() throws DuplicateInstanceException{

        ExerciseDto exerciseToAdd = new ExerciseDto("ejercicio test", "ejercicio test", grupoMuscular.PIERNA);

        ExerciseDto exerciseToAdd2 = new ExerciseDto("ejercicio test 2", "ejercicio test", grupoMuscular.PIERNA);


        Long idExercise1 = adminController.addProduct(exerciseToAdd);

        Long idExercise2 = adminController.addProduct(exerciseToAdd2);

        assertEquals((long) idExercise1,(long) idExercise2 - 1);


    }
}
