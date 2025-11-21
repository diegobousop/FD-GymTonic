import { useEffect, useState } from "react"; 
import backend from '../../../../backend';
import Pager from '../common/pager';
import Spinner from '../common/spinner';

const AvatarSelector = ({ selectedAvatar, setSelectedAvatar }) => {
  const [avatars, setAvatars] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(4);
  const [existMoreItems, setExistMoreItems] = useState(false);
  const [loading, setLoading] = useState(true);

  const getAvatars = (page) => {
      setLoading(true);
      backend.imageService.getAllAvatars(
      page,
      size,
      (response) => {
        if (response.items && Array.isArray(response.items)) {
          const mappedAvatars = response.items.map((item) => ({
            name: item.name,
            url: item.avatarBase64,
          }));
          setAvatars(mappedAvatars);
          setExistMoreItems(response.existMoreItems);
          setPage(page);
        } else {
          setError('La respuesta del backend no contiene avatares válidos.');
        }
        setLoading(false);
      },
      (error) => {
        setError('Error al cargar los avatares');
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    getAvatars(page);
  }, [page, size]);

    if (loading) {
        return <Spinner />;
    }

  return (
    <div className="flex flex-col mb-2">
      <p className="text-[12px]">Avatares</p>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        {avatars.map((avatar) => (
          <div key={avatar.name} className="flex flex-col">
            <img
              src={avatar.url}
              alt={avatar.name}
              className={`w-[134px] h-[134px] border-2 cursor-pointer ${
                selectedAvatar === avatar.name
                  ? 'border-white'
                  : 'border-transparent hover:border-red-500'
              }`}
              onClick={() => setSelectedAvatar(avatar.name)}
            />
          </div>
        ))}
      </div>
          <div className="pb-5">
            <Pager
              back={{
                onClick: () => getAvatars(page - 1),
                enabled: page > 0, // Habilitado solo si no estamos en la primera página
              }}
              next={{
                onClick: () => getAvatars(page + 1),
                enabled: existMoreItems, // Habilitado solo si hay más elementos disponibles
              }}
            />
          </div>
    </div>
  );  
};

export default AvatarSelector;