import { createFileRoute, redirect } from '@tanstack/react-router'
import '../lib/styles/routes/index.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Header3, Paragraph } from '@/components/typography'
import { Fingerprint } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export const Route = createFileRoute('/')({
	beforeLoad: async ({ context }) => {
		const { isAuthenticated } = context.authentication;
		const auth = await isAuthenticated()
		if (auth) {
			throw redirect({ to: '/page' });
		}
	},
	component: LoginForm,
})

function LoginForm() {
	const [currentForm, setCurrentForm] = useState("SignUp")
	return (
		<section className="auth">
			{
				currentForm === "Login" ? <SignForm /> : <CreateForm />
			}
		</section>
	)
}

function SignForm() {
	const { adminLogin } = useAuth()
	const navigate = useNavigate()

	const formSchema = z.object({
		adminEmail: z.string().min(2, {
			message: 'Not a valid email address',
		}),
		pin: z.string().min(6, {
			message: 'Not a valid pin must be a max of 6 and have a symbol, an upper and a lower case',
		}),
	})


	const { mutateAsync: signAdminMutation, isPending } = useMutation({
		mutationFn: adminLogin,
		onSuccess: () => {
			navigate({ to: "/users" })
		},
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			adminEmail: '',
			pin: '',
		},
	})
	async function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values)
		await signAdminMutation(values)
	}
	return (
		<div className="authWrap">
			<div className="authIcon">
				<Fingerprint size={40} />
			</div>
			<div className="authInfo">
				<Header3>Welcome Back</Header3>
				<Paragraph>Let's login into your account.</Paragraph>
			</div>
			<div className="authForm">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="adminEmail"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Admin Email</FormLabel>
									<FormControl>
										<Input placeholder="user@mail.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="pin"
							render={({ field }) => (
								<FormItem>
									<FormLabel>AdminPin</FormLabel>
									<FormControl>
										<Input placeholder="Enter your pin" {...field} type='password' />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="formAction">
							<Button type="submit" disabled={isPending}>
								{
									isPending ? "Signing Admin..." : "Login"
								}
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	)
}

function CreateForm() {
	const formSchema = z.object({
		adminFirstName: z
			.string()
			.min(1, { message: "First name is required" })
			.max(30, { message: "First name should not exceed 30 characters" }),
		adminLastName: z
			.string()
			.min(1, { message: "Last name is required" })
			.max(30, { message: "Last name should not exceed 30 characters" }),
		adminEmail: z
			.string()
			.email({ message: "Enter a valid email address" })
			.nonempty({ message: "Email is required" }),
		pin: z
			.string()
			.length(6, { message: "PIN must be exactly 6 characters" })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, {
				message: "PIN must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
			}),
	});

	const { adminRegister } = useAuth()
	const { toast } = useToast()
	const navigate = useNavigate()

	const { mutateAsync: signAdminMutation, isPending } = useMutation({
		mutationFn: adminRegister,
		onSuccess: (data) => {
			console.log(data)
			toast({
				variant: "default",
				title: "Admin Created",
			})
			navigate({ to: "/" })
		},
		onError: (err) => {
			console.error(err)
			toast({
				variant: "destructive",
				title: "Admin Creation Error",
				description: err.response.data.message || err.message,
			})
		}
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			adminFirstName: '',
			adminLastName: '',
			adminEmail: '',
			pin: '',
		},
	})
	async function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values)
		await signAdminMutation({
			adminName: `${values.adminFirstName} ${values.adminLastName}`,
			adminEmail: values.adminEmail,
			pin: values.pin
		})
	}
	return (
		<div className="authWrap">
			<div className="authIcon">
				<Fingerprint size={40} />
			</div>
			<div className="authInfo">
				<Header3>Welcome Back</Header3>
				<Paragraph>Let's login into your account.</Paragraph>
			</div>
			<div className="authForm">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>

						<div className="formWrap">
							<FormField
								control={form.control}
								name="adminFirstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First Name</FormLabel>
										<FormControl>
											<Input
												placeholder="First Name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="adminLastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Last Name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="adminEmail"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Admin Email</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter your email address"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="pin"
							render={({ field }) => (
								<FormItem>
									<FormLabel>AdminPin</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter your pin"
											{...field}
											type="password"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="formAction">
							<Button type="submit" disabled={isPending}>
								{
									isPending ? "Creating Admin.." : "Register Admin"
								}
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	)
}