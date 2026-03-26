import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { fetchPrivateVaultContents } from '../api/vault.api';

const PrivateVault = () => {
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchContents = async () => {
      const res = await fetchPrivateVaultContents();
      console.log(res.data);
      setContents(res.data.contents);
    }
    fetchContents();
  }, [])

  return (
    <div>
      <h1>Private Vault</h1>
    </div>
  )
}

export default PrivateVault