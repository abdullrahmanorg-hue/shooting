import React from 'react'
import LoginHero from '../commponent/LoginHero'
import LoginForm from '../commponent/LoginForm'

export default function LoginPage({ setUser }) {
  return (
    <div>
        <LoginHero/>
        <LoginForm setUser={setUser}/>
    </div>
  )
}
