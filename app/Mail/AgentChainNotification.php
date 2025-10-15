<?php

namespace App\Mail;

use App\Models\ChainChecker;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AgentChainNotification extends Mailable
{
    use Queueable, SerializesModels;

    public ChainChecker $chainChecker;
    public User $user;
    public string $updateUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(ChainChecker $chainChecker)
    {
        $this->chainChecker = $chainChecker;
        $this->user = $chainChecker->user;
        $this->updateUrl = config('app.url') . '/agent/chain-update/' . $chainChecker->agent_token;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Chain Checker Activated - ' . $this->user->name,
            to: [$this->chainChecker->agent_email],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.agent-chain-notification',
            with: [
                'chainChecker' => $this->chainChecker,
                'user' => $this->user,
                'updateUrl' => $this->updateUrl,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
