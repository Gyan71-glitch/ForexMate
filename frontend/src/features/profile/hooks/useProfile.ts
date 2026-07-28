import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileApi.getProfile(userId),
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => profileApi.updateProfile(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
};

export const useAddBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => profileApi.addBank(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
};

export const useDeleteBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, bankId }: { userId: string; bankId: string }) => profileApi.deleteBank(userId, bankId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
};

export const useAddAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => profileApi.addAddress(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, addressId }: { userId: string; addressId: string }) => profileApi.deleteAddress(userId, addressId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, addressId, data }: { userId: string; addressId: string; data: any }) => profileApi.updateAddress(userId, addressId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
};
