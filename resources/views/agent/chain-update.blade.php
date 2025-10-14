<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chain Update Portal - {{ $user->name }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        // Suppress Tailwind CDN console warning
        tailwind.config = {
            theme: {
                extend: {}
            }
        }
    </script>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto py-8 px-4">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm border mb-8">
            <div class="px-6 py-4 border-b">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 flex items-center">
                            🏠 <span class="ml-2">Moovey Chain Update Portal</span>
                        </h1>
                        <p class="text-gray-600 mt-1">Update your client's moving chain progress</p>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-500">Client</div>
                        <div class="font-semibold text-gray-900">{{ $user->name }}</div>
                    </div>
                </div>
            </div>
        </div>

        @if(session('success'))
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div class="flex items-center">
                    <div class="text-green-600 mr-3">✅</div>
                    <div class="text-green-800">{{ session('success') }}</div>
                </div>
            </div>
        @endif

        @if($errors->any())
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div class="flex items-start">
                    <div class="text-red-600 mr-3">❌</div>
                    <div class="flex-1">
                        <div class="text-red-800 font-semibold mb-2">Please fix the following errors:</div>
                        <ul class="list-disc list-inside text-red-700 text-sm">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        @endif

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Chain Information -->
            <div class="bg-white rounded-lg shadow-sm border">
                <div class="px-6 py-4 border-b">
                    <h2 class="text-lg font-semibold text-gray-900">📋 Chain Information</h2>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Move Type:</span>
                            <span class="font-semibold">{{ ucfirst(str_replace('_', ' ', $chainChecker->move_type)) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Chain Length:</span>
                            <span class="font-semibold">{{ $chainChecker->chain_length }} properties</span>
                        </div>
                        @if($chainChecker->estimated_completion)
                        <div class="flex justify-between">
                            <span class="text-gray-600">Target Completion:</span>
                            <span class="font-semibold">{{ $chainChecker->estimated_completion->format('j M Y') }}</span>
                        </div>
                        @endif
                        <div class="flex justify-between">
                            <span class="text-gray-600">Progress:</span>
                            <span class="font-semibold">{{ $chainChecker->progress_score ?? 0 }}%</span>
                        </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="mt-4">
                        <div class="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Chain Progress</span>
                            <span>{{ $chainChecker->progress_score ?? 0 }}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3">
                            <div class="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                                 style="width: {{ $chainChecker->progress_score ?? 0 }}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Submit Update Form -->
            <div class="bg-white rounded-lg shadow-sm border">
                <div class="px-6 py-4 border-b">
                    <h2 class="text-lg font-semibold text-gray-900">📝 Submit Update</h2>
                </div>
                <div class="p-6">
                    <form action="{{ route('agent.chain-update.submit', $token) }}" method="POST" class="space-y-4">
                        @csrf
                        
                        <!-- Update Type -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Update Type</label>
                            <select name="update_type" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select update type...</option>
                                <option value="progress">Progress Update</option>
                                <option value="delay">Delay/Issue</option>
                                <option value="completion">Completion</option>
                            </select>
                        </div>

                        <!-- Title -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Update Title</label>
                            <input type="text" name="title" required maxlength="255" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   placeholder="e.g., Surveys completed, Mortgage approved">
                        </div>

                        <!-- Description -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea name="description" required maxlength="1000" rows="4"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Provide detailed information about this update..."></textarea>
                        </div>

                        <!-- Stage Update (Optional) -->
                        <div class="border-t pt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Mark Stage as Complete (Optional)</label>
                            <select name="stage" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">No stage update</option>
                                <option value="offer_accepted">Offer Accepted</option>
                                <option value="searches_surveys">Searches & Surveys</option>
                                <option value="mortgage_approval">Mortgage Approval</option>
                                <option value="contracts_exchanged">Contracts Exchanged</option>
                                <option value="completion">Completion</option>
                            </select>
                            <div class="mt-2">
                                <label class="flex items-center">
                                    <input type="checkbox" name="stage_completed" value="1" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                    <span class="ml-2 text-sm text-gray-700">Mark this stage as completed</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold">
                            📤 Submit Update
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Recent Updates -->
        @if($chainChecker->updates && $chainChecker->updates->count() > 0)
        <div class="bg-white rounded-lg shadow-sm border mt-8">
            <div class="px-6 py-4 border-b">
                <h2 class="text-lg font-semibold text-gray-900">🔔 Recent Updates</h2>
            </div>
            <div class="divide-y">
                @foreach($chainChecker->updates->take(5) as $update)
                <div class="p-6">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2">
                                <h3 class="font-semibold text-gray-900">{{ $update->title }}</h3>
                                @php
                                    if ($update->update_type === 'progress') {
                                        $badgeClass = 'bg-green-100 text-green-800';
                                    } elseif ($update->update_type === 'delay') {
                                        $badgeClass = 'bg-yellow-100 text-yellow-800';
                                    } else {
                                        $badgeClass = 'bg-blue-100 text-blue-800';
                                    }
                                @endphp
                                <span class="px-2 py-1 text-xs rounded-full {{ $badgeClass }}">
                                    {{ ucfirst($update->update_type) }}
                                </span>
                            </div>
                            <p class="text-gray-600 mt-1">{{ $update->description }}</p>
                            <div class="text-sm text-gray-500 mt-2">
                                {{ $update->created_at->format('j M Y, g:i A') }}
                                @if($update->agent_name)
                                    • by {{ $update->agent_name }}
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        <!-- Footer -->
        <div class="text-center mt-8 text-gray-500 text-sm">
            <p>This secure portal allows you to update your client's moving chain progress.</p>
            <p class="mt-1">© {{ date('Y') }} Moovey - Making Moving Simple</p>
        </div>
    </div>
</body>
</html>