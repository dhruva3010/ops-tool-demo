import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingPage } from '../../components/ui';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      toast.error('OAuth authentication failed');
      navigate('/login');
      return;
    }

    if (accessToken && refreshToken) {
      handleOAuthCallback(accessToken, refreshToken);
      toast.success('Welcome!');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, handleOAuthCallback]);

  return <LoadingPage />;
}
