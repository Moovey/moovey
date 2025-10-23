import { router } from '@inertiajs/react';

export interface School {
    id: string;
    name: string;
    address: string;
    coordinates: [number, number];
    catchmentZones: any[];
    averageCatchment?: any;
    isActive: boolean;
    isFavorite: boolean;
}

export interface FavoriteSchoolsResponse {
    success: boolean;
    schools?: School[];
    school?: School;
    message: string;
}

class FavoriteSchoolsService {
    private baseUrl = '/api/favorite-schools';

    /**
     * Get all favorite schools for the current user
     */
    async getFavoriteSchools(): Promise<School[]> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const schools = await response.json();
            return schools;
        } catch (error) {
            console.error('Error loading favorite schools:', error);
            return [];
        }
    }

    /**
     * Add a school to favorites
     */
    async addFavoriteSchool(school: School): Promise<FavoriteSchoolsResponse> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': this.getCSRFToken()
                },
                credentials: 'include',
                body: JSON.stringify({ school })
            });

            const result = await response.json();
            
            if (!response.ok) {
                console.error('Failed to add favorite school:', result);
                return {
                    success: false,
                    message: result.message || 'Failed to add school to favorites'
                };
            }

            return result;
        } catch (error) {
            console.error('Error adding favorite school:', error);
            return {
                success: false,
                message: 'Network error while adding school to favorites'
            };
        }
    }

    /**
     * Update a favorite school (e.g., when catchment zones change)
     */
    async updateFavoriteSchool(school: School): Promise<FavoriteSchoolsResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/${school.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': this.getCSRFToken()
                },
                credentials: 'include',
                body: JSON.stringify({ school })
            });

            const result = await response.json();
            
            if (!response.ok) {
                console.error('Failed to update favorite school:', result);
                return {
                    success: false,
                    message: result.message || 'Failed to update favorite school'
                };
            }

            return result;
        } catch (error) {
            console.error('Error updating favorite school:', error);
            return {
                success: false,
                message: 'Network error while updating favorite school'
            };
        }
    }

    /**
     * Remove a school from favorites
     */
    async removeFavoriteSchool(schoolId: string): Promise<FavoriteSchoolsResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/${schoolId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': this.getCSRFToken()
                },
                credentials: 'include'
            });

            const result = await response.json();
            
            if (!response.ok) {
                console.error('Failed to remove favorite school:', result);
                return {
                    success: false,
                    message: result.message || 'Failed to remove school from favorites'
                };
            }

            return result;
        } catch (error) {
            console.error('Error removing favorite school:', error);
            return {
                success: false,
                message: 'Network error while removing school from favorites'
            };
        }
    }

    /**
     * Bulk update all favorite schools (useful for batch operations)
     */
    async bulkUpdateFavoriteSchools(schools: School[]): Promise<FavoriteSchoolsResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/bulk-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': this.getCSRFToken()
                },
                credentials: 'include',
                body: JSON.stringify({ schools })
            });

            const result = await response.json();
            
            if (!response.ok) {
                console.error('Failed to bulk update favorite schools:', result);
                return {
                    success: false,
                    message: result.message || 'Failed to update favorite schools'
                };
            }

            return result;
        } catch (error) {
            console.error('Error bulk updating favorite schools:', error);
            return {
                success: false,
                message: 'Network error while updating favorite schools'
            };
        }
    }

    /**
     * Get CSRF token from meta tag
     */
    private getCSRFToken(): string {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            console.warn('CSRF token not found');
            return '';
        }
        return token;
    }
}

export const favoriteSchoolsService = new FavoriteSchoolsService();