import * as commentService from '../../backend/commentService';
import { appFetch, fetchConfig } from '../../backend/appFetch';

jest.mock('../../backend/appFetch');

describe('commentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetchConfig.mockImplementation((method, body) => ({ method, body }));
    });


    describe('addComment', () => {
        it('llama appFetch con datos de comentario', () => {
        const mockOnSuccess = jest.fn();
        const mockOnErrors = jest.fn();

        commentService.addComment(
            1,
            "comentario",
            mockOnSuccess,
            mockOnErrors
        );

        expect(appFetch).toHaveBeenCalledWith(
            '/comment/addComment',
            expect.objectContaining({ method: 'POST' }),
            mockOnSuccess,
            mockOnErrors
        );
        });
    });

    describe('getComments', () => {
    it('llama appFetch con paginación', () => {
        const mockOnSuccess = jest.fn();
        const mockOnErrors = jest.fn();

        commentService.getComments(
            1,
            { page: 0, size: 10 },
            mockOnSuccess,
            mockOnErrors
        );

        expect(appFetch).toHaveBeenCalledWith(
        '/comment/getComments/1?page=0&size=10',
        expect.objectContaining({ method: 'GET' }),
        mockOnSuccess,
        mockOnErrors
        );
    });
    });
})