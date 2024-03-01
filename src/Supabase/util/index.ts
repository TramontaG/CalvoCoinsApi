import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

export const returnResponse = <T>(
    result: PostgrestResponse<T> | PostgrestSingleResponse<T>
) => {
    if (result.error) {
        return {
            error: result.error,
            data: null,
        };
    }

    return {
        error: null,
        data: result.data,
    };
};
