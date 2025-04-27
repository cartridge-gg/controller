import {
  FollowerSocialList,
  FollowerSocialRow,
  FollowerTabs,
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
  TabsContent,
} from "@cartridge/ui-next";
import { useAccount, useUsernames } from "#hooks/account";
import { useCallback, useMemo, useState } from "react";
import { useArcade } from "#hooks/arcade.js";
import { BigNumberish, getChecksumAddress } from "starknet";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useConnection, useData } from "#hooks/context.js";
import { toast } from "sonner";

export function Socials() {
  const { address } = useAccount();
  const { parent, closable, visitor } = useConnection();
  const {
    chainId,
    provider,
    followers: allFollowers,
    followeds: allFolloweds,
  } = useArcade();
  const {
    trophies: { players },
  } = useData();
  const [loading, setLoading] = useState<BigNumberish | null>(null);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const value = useMemo(() => {
    return searchParams.get("social") ?? "followers";
  }, [searchParams]);

  const onBack = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("social");
    navigate(url.toString().replace(window.location.origin, ""));
  }, [navigate]);

  const { baseFollowers, baseFolloweds } = useMemo(() => {
    return {
      baseFollowers: allFollowers[getChecksumAddress(address)] ?? [],
      baseFolloweds: allFolloweds[getChecksumAddress(address)] ?? [],
    };
  }, [allFollowers, allFolloweds, address]);

  const addresses = useMemo(() => {
    return [...baseFollowers, ...baseFolloweds].map(
      (address) => `0x${BigInt(address).toString(16)}`,
    );
  }, [baseFollowers, baseFolloweds]);

  const { usernames } = useUsernames({ addresses });

  const points = useMemo(() => {
    const points: Record<string, number> = {};
    players.forEach((player) => {
      points[getChecksumAddress(player.address)] = player.earnings;
    });
    return points;
  }, [players]);

  const { followers, followeds } = useMemo(() => {
    const followers = baseFollowers
      .map((follower) => {
        const username = usernames.find(
          (username) => BigInt(username.address ?? "0x0") === BigInt(follower),
        );
        return {
          address: follower,
          username:
            username?.username ??
            `0x${BigInt(follower).toString(16)}`.slice(0, 9),
          points: points[getChecksumAddress(follower)] || 0,
          following: baseFolloweds.includes(getChecksumAddress(follower)),
        };
      })
      .sort((a, b) => b.points - a.points);
    const followeds = baseFolloweds
      .map((followee) => {
        const username = usernames.find(
          (username) => BigInt(username.address ?? "0x0") === BigInt(followee),
        );
        return {
          address: followee,
          username:
            username?.username ??
            `0x${BigInt(followee).toString(16)}`.slice(0, 9),
          points: points[getChecksumAddress(followee)] || 0,
          following: false,
        };
      })
      .sort((a, b) => b.points - a.points);
    return { followers, followeds };
  }, [baseFollowers, baseFolloweds, address, usernames, points]);

  const handleSocialClick = useCallback(
    (
      target: BigNumberish,
      follow: boolean,
      setLoading: (address: BigNumberish | null) => void,
    ) => {
      if (!target) return;
      const process = async () => {
        setLoading(target);
        try {
          const calls = follow
            ? provider.social.follow({ target })
            : provider.social.unfollow({ target });
          const res = await parent.openExecute(
            Array.isArray(calls) ? calls : [calls],
            chainId,
          );
          if (res && res.transactionHash) {
            toast.success(`${follow ? "Followed" : "Unfollowed"} successfully`);
          }
        } catch (error) {
          console.error(error);
          toast.error(`Failed to ${follow ? "follow" : "unfollow"}`);
        } finally {
          setLoading(null);
        }
      };
      process();
    },
    [chainId, provider, parent],
  );

  return (
    <LayoutContainer>
      <LayoutHeader
        variant="hidden"
        onBack={closable || visitor ? undefined : onBack}
      />
      <LayoutContent className="py-6 gap-y-6 select-none overflow-hidden">
        <FollowerTabs
          defaultValue={value}
          followers={followers.length}
          following={followeds.length}
          className="overflow-hidden"
        >
          <TabsContent
            className="p-0 mt-4 h-[calc(100%-56px)]"
            value="followers"
          >
            <FollowerSocialList>
              {followers.map((item) => (
                <FollowerSocialRow
                  key={item.address}
                  username={item.username}
                  points={item.points}
                  following={item.following}
                  unfollowable={false}
                  loading={BigInt(loading || 0) === BigInt(item.address)}
                  disabled={
                    loading !== null &&
                    BigInt(loading || 0) !== BigInt(item.address)
                  }
                  onSocialClick={() =>
                    handleSocialClick(item.address, true, setLoading)
                  }
                />
              ))}
            </FollowerSocialList>
          </TabsContent>
          <TabsContent
            className="p-0 mt-4 h-[calc(100%-56px)]"
            value="following"
          >
            <FollowerSocialList>
              {followeds.map((item) => (
                <FollowerSocialRow
                  key={item.address}
                  username={item.username}
                  points={item.points}
                  following={true}
                  unfollowable={true}
                  loading={BigInt(loading || 0) === BigInt(item.address)}
                  disabled={
                    loading !== null &&
                    BigInt(loading || 0) !== BigInt(item.address)
                  }
                  onSocialClick={() =>
                    handleSocialClick(item.address, false, setLoading)
                  }
                />
              ))}
            </FollowerSocialList>
          </TabsContent>
        </FollowerTabs>
      </LayoutContent>
    </LayoutContainer>
  );
}
