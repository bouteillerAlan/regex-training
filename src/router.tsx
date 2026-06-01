import { createRouter, createRoute, createRootRoute, Navigate } from '@tanstack/react-router'
import Layout from './pages/Layout'
import Playground from './pages/Playground'
import Daily from './pages/Daily'
import ExercisesList from './pages/ExercisesList'
import ExerciseDetail from './pages/ExerciseDetail'

const rootRoute = createRootRoute({
  component: Layout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Navigate to="/daily" />,
})

const playgroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/playground',
  component: Playground,
})

const dailyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/daily',
  component: Daily,
})

const exercisesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/exercises',
  component: ExercisesList,
})

const exerciseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/exercises/$id',
  component: ExerciseDetail,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  playgroundRoute,
  dailyRoute,
  exercisesRoute,
  exerciseDetailRoute,
])

const router = createRouter({ routeTree })

export default router
